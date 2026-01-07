FROM postgres:17
ENV POSTGRES_USER=test
ENV POSTGRES_PASSWORD=123
ENV POSTGRES_DB=test_db
COPY ./init/init.sql /docker-entrypoint-initdb.d/
#COPY init_db.sh /
#RUN ["chmod", "777", "/init_db.sh"]
#CMD ["/init_db.sh"]
