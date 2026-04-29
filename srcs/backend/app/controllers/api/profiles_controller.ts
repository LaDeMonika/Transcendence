import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import fs from 'fs'
import Quiz from '#models/Quiz'
import QuizPlayer from '#models/quizsession/quiz_player'
import Session from '#models/quizsession/quizsession'
import Question from '#models/Question'
import QuizAnswer from '#models/quizsession/quiz_answer'
import db from '@adonisjs/lucid/services/db'

export default class ProfilesController {
    /**
     *  Use privateProfile method to retrieve all information of current user
     */
    async privateProfile({ auth }: HttpContext) {
        const authenticatedUser = auth.user as User
        const user = await User.find(authenticatedUser.id)
        return user!.serialize()
    }
    /**
     *  Use publicProfile method to retrieve information that what other users can see
     *  Can be used to see what other people see in your profile
     *  @params userId of target user
     */
    async publicProfile({ request, response }: HttpContext) {
        const data = request.params()
        data.userId = Number(data.userId)
        if (Number.isNaN(data.userId)) return response.status(400).send({ errors: [{ messages: 'Invalid userId' }] })
        const user = await User.find(data.userId)
        if (!user) return response.status(400).send({ error: [{ messages: 'User not found' }] })
        return user.serialize()
    }
    
    // update methods will be added for different parts
    // update(ctx: HttpContext) {
    //     return ctx.response.ok({ message: "request got update profile" })
    // }

    /****************************************************************/
    /*                    PROFILE PICTURE                           */
    /****************************************************************/

  /**
   * @uploadAvatar
   * @tag profile
   * @description upload profile avatar
   * @requestFormDataBody {"file":{"type": "file"}}
   */
    async uploadAvatar({ request, response, auth } :HttpContext) {
        const user = auth.user as User
        if (!user) return response.badRequest({ message: 'user not found' })

        const file = request.file('file', {
            extnames: ['png', 'jpg'],
            size: '5mb'
        })
        if (!file) return response.badRequest({
            error: [{ messages: 'No file provided' }]
        })

        if (!file.isValid) return response.badRequest({
            error: file.errors
        })
        await file.move('/images', {
            name: `${cuid()}.${file.extname}`
        })

        if (!file.fileName) return response.status(500).send({ message: 'Can not save file' })

        if (user.avatarUrl)
        {
            const path = '/images' + user.avatarUrl
            fs.unlink(path, (err) => console.log('old file deleted: ', user.avatarUrl, err))
        }
        user.avatarUrl = file.fileName
        await user.save()
        return response.ok({ message: 'Avatar url updated' })
    }

    /**
     * @getAvatar
     * @tag profile
     * @description download profile avatar
     */
    async getAvatar({ request, response }: HttpContext) {
        const targetUserId = Number(request.param('userid'));
        if (isNaN(targetUserId)) return response.badRequest({ message: 'Invalid user id' })
        const user = await User.find(targetUserId)
        if (!user) return response.badRequest({ message: 'User not found' })
        const absolutePath = '/images/' + (user.avatarUrl || 'default.png') 
        //console.log('Avatar path: ', absolutePath)
        return response.download(absolutePath)
    }

    /**
     * @deleteAvatar
     * @tag profile
     * @description download profile avatar
     */
    async deleteAvatar({ response, auth }: HttpContext) {
        const user = auth.user as User
        if (!user.avatarUrl) return response.badRequest({ message: 'No custom avatar picture'})
        const absolutePath = '/images/' + user.avatarUrl
        fs.unlink(absolutePath, () => null)
        user.avatarUrl = null
        await user.save()
        return response.ok({ message: 'Avatar deleted' })
    }
    
    /****************************************************************/
    /*                    DASHBOARD - STATISTICS                    */
    /****************************************************************/

    /**
     * @myQuizzes
     * @tag profile
     * @description all quizzes that current user attended
     */
    async myQuizzes({ response, auth }:HttpContext) {
        const user = auth.user as User
        const quizzes = await QuizPlayer.findManyBy('userId', user.id)
        if (!quizzes.length) return response.ok({ message: 'User did not play any games yet' })
        const promises = quizzes.map(async (q) => {
            const quizSession = await Session.find(q.sessionId)
            if (!quizSession) return null
            const quiz = await Quiz.find(quizSession.quizId)
            if (!quiz) return null
            const questions = await Question.query().where('quiz_id', quiz.id).count('* as count')
            const correctAnswersCount = await QuizAnswer.query().where('session_id', q.sessionId).andWhere('user_id', user.id).andWhere('is_correct', true).count('* as count')
            return {
                ...quiz?.serialize(),
                questionCount: Number(questions[0].$extras.count),
                score: q.score,
                correctAnswerCount: Number(correctAnswersCount[0].$extras.count)
                }
        })
        const result = await Promise.all(promises)
        return (result.filter((r) => r !== null))
    }

    /**
     * @othersQuizzes
     * @tag profile
     * @description find last 5 quizzes according to given userID
     */
    async othersQuizzes({ request, response }:HttpContext) {
        const userId = Number(request.param('userid'))
        if (isNaN(userId)) return response.badRequest({ error: [{ message: 'Invalid user id' }]})
        
        const user = await User.find(userId)
        if (!user) return response.badRequest({ error: [{ message: 'User not fount' }]})
        
        const quizzes = await QuizPlayer.query().where('userId', user.id).orderBy('createdAt').limit(5)
        if (!quizzes.length) return response.ok({ error:[{ message: 'User did not play any games yet' }]})
        const promises = quizzes.map(async (q) => {
            const quizSession =  await Session.find(q.sessionId)
            const quiz = await Quiz.find(quizSession!.quizId)
            const questionCount = await Question.query().where('quiz_id', quiz!.id).count('*')
            return {
                ...quiz?.serialize(),
                questionCount: questionCount,
                score: q.score
            }
        })
        const result = await Promise.all(promises)
        return (result)
    }

    async stats({ request, response }:HttpContext) {
        const userId = Number(request.param('userid'))
        if (isNaN(userId)) return response.badRequest({ error: [{ message: 'Invalid user id' }]})
        const user = await User.find(userId)
        if (!user) return response.badRequest({ error: [{ message: 'User not found' }]})
        const gameSessions = await QuizPlayer.query().where('user_id', user.id).count('* as count').first()
        const totalQuestions = await QuizPlayer.query()
            .join('quiz_sessions', 'quiz_players.session_id', '=', 'quiz_sessions.id')
            .join('quizzes', 'quizzes.id', '=', 'quiz_sessions.quiz_id')
            .join('questions', 'questions.quiz_id', '=', 'quizzes.id')
            .where('user_id', user.id)
            .count('questions.question as count')
            .first()
        const totalAnswers = await QuizPlayer.query()
            .join('quiz_sessions', (query) => {
                query
                    .on('quiz_players.session_id', '=', 'quiz_sessions.id')
            })
            .join('quizzes', 'quizzes.id', '=', 'quiz_sessions.quiz_id')
            .join('questions', 'questions.quiz_id', '=', 'quizzes.id')
            .join('quiz_answers', (query) => {
                query
                    .on('quiz_answers.question_id', '=', 'questions.id')
                    .andOn('quiz_sessions.id', '=', 'quiz_answers.session_id')
                    .andOn('quiz_answers.user_id', '=', 'quiz_players.user_id')
            })
            .where('quiz_players.user_id', user.id)
            .count('* as total')
            .first()
        
        const correctAnswers = await QuizPlayer.query()
            .join('quiz_sessions', (query) => {
                query
                    .on('quiz_players.session_id', '=', 'quiz_sessions.id')
            })
            .join('quizzes', 'quizzes.id', '=', 'quiz_sessions.quiz_id')
            .join('questions', 'questions.quiz_id', '=', 'quizzes.id')
            .join('quiz_answers', (query) => {
                query
                    .on('quiz_answers.question_id', '=', 'questions.id')
                    .andOn('quiz_sessions.id', '=', 'quiz_answers.session_id')
                    .andOn('quiz_answers.user_id', '=', 'quiz_players.user_id')
            })
            .where('quiz_players.user_id', user.id)
            .where('quiz_answers.is_correct', true)
            .count('* as count')
            .first()
        
        return response.ok({
            'playedSessions': Number(gameSessions?.$extras.count ?? 0),
            'totalQuestions': Number(totalQuestions?.$extras.count ?? 0),
            'totalAnswers': Number(totalAnswers?.$extras.total ?? 0),
            'totalCorrectAnswers': Number(correctAnswers?.$extras.count ?? 0)
        })
    }

    async leaderboard({ request, response }:HttpContext) {
        try {
            const leaderboard = await db
                .from('users')
                .leftJoin('quiz_players', 'users.id', 'quiz_players.user_id')
                .select('users.id', 'users.user_name')
                .select(db.raw('COALESCE(SUM(quiz_players.score), 0) as total_score'))
                .groupBy('users.id', 'users.user_name')
                .orderBy('total_score', 'desc')
                .limit(50) // Limit to top 50 players

            return response.ok(leaderboard)
        } catch (error) {
            console.error('Leaderboard error:', error)
            return response.internalServerError({ error: 'Failed to fetch leaderboard' })
        }
    }
}
