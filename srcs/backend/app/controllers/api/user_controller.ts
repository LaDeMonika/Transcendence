// User Controller
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export default class UserController {
    // GET /api/me
    public async me({ auth }: HttpContext) {
        const user = await auth.authenticate() as User
        return { id: user.id, userName: user.userName }
    }

    // GET /api/users
    public async index() {
        const users = await User.query().select('id', 'userName')
        return users
    }

    // GET /api/user/:id
    public async show({ params }: HttpContext) {
        const { id } = params
        const user = await User.query().where('id', id).select('id', 'userName').firstOrFail()
        return user
    }

    // GET /api/search-users?query=someName
    public async search({ request }: HttpContext) {
        const { query } = request.only(['query'])
        const users = await User.query().select('id', 'userName').where('userName', 'like', `%${query}%`)
        return users
    }

    // POST /api/update-username
    public async updateUsername({ request, auth, response }: HttpContext) {
        const { newUsername } = request.only(['newUsername'])
        const user = await auth.authenticate() as User

        // Check if the new username is already taken
        const existingUser = await User.query().where('userName', newUsername).first()
        if (existingUser) {
            return response.badRequest({ error: 'Username is already taken' })
        }

        user.userName = newUsername
        await user.save()
        return { id: user.id, userName: user.userName }
    }

    // DELETE /api/user
    public async destroy({ auth }: HttpContext) {
        const user = await auth.authenticate() as User
        const trx = await db.transaction()

        try {
            await trx
                .from('friends')
                .where('user_id', user.id)
                .orWhere('friend_id', user.id)
                .delete()

            user.useTransaction(trx)
            await user.delete()

            await trx.commit()
            return { message: 'User deleted successfully' }
        } catch (error) {
            await trx.rollback()
            throw error
        }
    }

    // GET /api/user/:id/stats
    // show quiz stats for user (correct/incorrect answers, total quizzes played, etc.)
    public async stats({ params }: HttpContext) {
        type AnswerStatsRow = {
            totalAnswers: number | string | null
            correctAnswers: number | string | null
            totalPoints: number | string | null
        }

        type QuizStatsRow = {
            totalQuizzesPlayed: number | string | null
            totalScore: number | string | null
            bestScore: number | string | null
        }

        const [answerStatsRow, quizStatsRow] = await Promise.all([
            db
                .from('quiz_answers')
                .where('user_id', params.id)
                .select(
                    db.rawQuery('count(*) as "totalAnswers"'),
                    db.rawQuery('sum(case when is_correct then 1 else 0 end) as "correctAnswers"'),
                    db.rawQuery('coalesce(sum(points), 0) as "totalPoints"')
                )
                .first() as Promise<AnswerStatsRow | null>,
            db
                .from('quiz_players')
                .where('user_id', params.id)
                .select(
                    db.rawQuery('count(*) as "totalQuizzesPlayed"'),
                    db.rawQuery('coalesce(sum(score), 0) as "totalScore"'),
                    db.rawQuery('coalesce(max(score), 0) as "bestScore"')
                )
                .first() as Promise<QuizStatsRow | null>,
        ])

        const totalAnswers = Number(answerStatsRow?.totalAnswers ?? 0)
        const correctAnswers = Number(answerStatsRow?.correctAnswers ?? 0)
        const totalPointsFromAnswers = Number(answerStatsRow?.totalPoints ?? 0)
        const totalQuizzesPlayed = Number(quizStatsRow?.totalQuizzesPlayed ?? 0)
        const totalScore = Number(quizStatsRow?.totalScore ?? 0)
        const bestScore = Number(quizStatsRow?.bestScore ?? 0)
        const incorrectAnswers = totalAnswers - correctAnswers

        return {
            userId: params.id,
            stats: {
                totalQuizzesPlayed,
                totalAnswers,
                correctAnswers,
                incorrectAnswers,
                accuracy: totalAnswers > 0 ? correctAnswers / totalAnswers : 0,
                totalScore,
                bestScore,
                averageScore: totalQuizzesPlayed > 0 ? totalScore / totalQuizzesPlayed : 0,
                totalPointsFromAnswers,
            },
        }
    }
}
