--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: domains; Type: TABLE; Schema: public; Owner: chess; Tablespace: 
--

CREATE TABLE domains (
    id integer NOT NULL,
    name text
);


ALTER TABLE public.domains OWNER TO chess;

--
-- Name: domains_id_seq; Type: SEQUENCE; Schema: public; Owner: chess
--

CREATE SEQUENCE domains_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.domains_id_seq OWNER TO chess;

--
-- Name: domains_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chess
--

ALTER SEQUENCE domains_id_seq OWNED BY domains.id;


--
-- Name: mails; Type: TABLE; Schema: public; Owner: chess; Tablespace: 
--

CREATE TABLE mails (
    id integer NOT NULL,
    mail text,
    login_id integer NOT NULL,
    domain_id integer NOT NULL,
    date_create timestamp without time zone NOT NULL,
    date_deleted timestamp without time zone
);


ALTER TABLE public.mails OWNER TO chess;

--
-- Name: users; Type: TABLE; Schema: public; Owner: chess; Tablespace: 
--

CREATE TABLE users (
    id integer NOT NULL,
    login text,
    passwd text,
    conf text,
    date_deleted timestamp without time zone,
    date_create timestamp without time zone NOT NULL,
    confirmed boolean DEFAULT false NOT NULL,
    elo real NOT NULL DEFAULT 1500,
    nb_news int NOT NULL DEFAULT 0,
    alerte_free boolean default false,
	free_user text,
	free_code text
);


ALTER TABLE public.users OWNER TO chess;

--
-- Name: emails; Type: VIEW; Schema: public; Owner: chess
--

CREATE VIEW emails AS
    SELECT pg_catalog.concat(m.mail, '@', d.name) AS email, u.login FROM users u, domains d, mails m WHERE ((((u.id = m.login_id) AND (m.domain_id = d.id)) AND (u.date_deleted IS NULL)) AND (m.date_deleted IS NULL));


ALTER TABLE public.emails OWNER TO chess;

--
-- Name: games; Type: TABLE; Schema: public; Owner: chess; Tablespace: 
--

CREATE TABLE games (
    white integer NOT NULL,
    black integer NOT NULL,
    winner integer,
    date timestamp without time zone NOT NULL,
    id integer NOT NULL,
    token text
);


ALTER TABLE public.games OWNER TO chess;

--
-- Name: games_id_seq; Type: SEQUENCE; Schema: public; Owner: chess
--

CREATE SEQUENCE games_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.games_id_seq OWNER TO chess;

--
-- Name: games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chess
--

ALTER SEQUENCE games_id_seq OWNED BY games.id;


--
-- Name: historique; Type: TABLE; Schema: public; Owner: chess; Tablespace: 
--

CREATE TABLE historique (
    game_id integer NOT NULL,
    id integer NOT NULL,
    joueur integer NOT NULL,
    coup text,
    date timestamp NOT NULL default '2000-01-01 00:00:00.000000+02',
	CONSTRAINT historique_joueur_id_fkey FOREIGN KEY (joueur)
	REFERENCES users (id) MATCH SIMPLE
	ON UPDATE NO ACTION ON DELETE NO ACTION
);



ALTER TABLE public.historique OWNER TO chess;

--
-- Name: historique_id_seq; Type: SEQUENCE; Schema: public; Owner: chess
--

CREATE SEQUENCE historique_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.historique_id_seq OWNER TO chess;

--
-- Name: historique_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chess
--

ALTER SEQUENCE historique_id_seq OWNED BY historique.id;


--
-- Name: mails_id_seq; Type: SEQUENCE; Schema: public; Owner: chess
--

CREATE SEQUENCE mails_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mails_id_seq OWNER TO chess;

--
-- Name: mails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chess
--

ALTER SEQUENCE mails_id_seq OWNED BY mails.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: chess
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO chess;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chess
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: v_games_players; Type: VIEW; Schema: public; Owner: chess
--

CREATE VIEW v_games_players AS
    SELECT g1.id, u1.login AS white, u2.login AS black, g1.date FROM games g1, users u1, games g2, users u2 WHERE (((g1.white = u1.id) AND (g2.black = u2.id)) AND (g1.id = g2.id));


ALTER TABLE public.v_games_players OWNER TO chess;

--
-- Name: id; Type: DEFAULT; Schema: public; Owner: chess
--

ALTER TABLE ONLY domains ALTER COLUMN id SET DEFAULT nextval('domains_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: chess
--

ALTER TABLE ONLY games ALTER COLUMN id SET DEFAULT nextval('games_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: chess
--

ALTER TABLE ONLY historique ALTER COLUMN id SET DEFAULT nextval('historique_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: chess
--

ALTER TABLE ONLY mails ALTER COLUMN id SET DEFAULT nextval('mails_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: chess
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: domains_name_key; Type: CONSTRAINT; Schema: public; Owner: chess; Tablespace: 
--

ALTER TABLE ONLY domains
    ADD CONSTRAINT domains_name_key UNIQUE (name);


--
-- Name: domains_pkey; Type: CONSTRAINT; Schema: public; Owner: chess; Tablespace: 
--

ALTER TABLE ONLY domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (id);


--
-- Name: games_pkey; Type: CONSTRAINT; Schema: public; Owner: chess; Tablespace: 
--

ALTER TABLE ONLY games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: historique_pkey; Type: CONSTRAINT; Schema: public; Owner: chess; Tablespace: 
--

ALTER TABLE ONLY historique
    ADD CONSTRAINT historique_pkey PRIMARY KEY (id);


--
-- Name: mails_pkey; Type: CONSTRAINT; Schema: public; Owner: chess; Tablespace: 
--

ALTER TABLE ONLY mails
    ADD CONSTRAINT mails_pkey PRIMARY KEY (id);


--
-- Name: users_login_key; Type: CONSTRAINT; Schema: public; Owner: chess; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: chess; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: games_black_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chess
--

ALTER TABLE ONLY games
    ADD CONSTRAINT games_black_fkey FOREIGN KEY (black) REFERENCES users(id);


--
-- Name: games_white_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chess
--

ALTER TABLE ONLY games
    ADD CONSTRAINT games_white_fkey FOREIGN KEY (white) REFERENCES users(id);


--
-- Name: historique_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chess
--

ALTER TABLE ONLY historique
    ADD CONSTRAINT historique_game_id_fkey FOREIGN KEY (game_id) REFERENCES games(id);


--
-- Name: mails_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chess
--

ALTER TABLE ONLY mails
    ADD CONSTRAINT mails_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES domains(id);


--
-- Name: mails_login_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chess
--

ALTER TABLE ONLY mails
    ADD CONSTRAINT mails_login_id_fkey FOREIGN KEY (login_id) REFERENCES users(id);

-- Table: error

CREATE TABLE error
(
  game_id integer,
  id serial NOT NULL,
  date timestamp without time zone,
  login_id integer,
  texte text,
  CONSTRAINT error_pkey PRIMARY KEY (id ),
  CONSTRAINT error_game_id_fkey FOREIGN KEY (game_id)
      REFERENCES games (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT error_login_id_fkey FOREIGN KEY (login_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE error
  OWNER TO chess;
  
-- Table: sessions

CREATE TABLE sessions
(
  id serial NOT NULL,
  user_id integer,
  session text,
  CONSTRAINT sessions_pkey PRIMARY KEY (id ),
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE sessions
  OWNER TO chess;

-- View: v_list_games

CREATE OR REPLACE VIEW v_list_games AS 
 SELECT uw.login AS l_white, ub.login AS l_black, t.white, t.black, t.id, t.winner, t.date
   FROM (         SELECT g1.white, g1.black, g1.id, g1.winner, g1.date
                   FROM games g1
        UNION 
                 SELECT g2.black AS white, g2.white AS black, g2.id, g2.winner, g2.date
                   FROM games g2) t, users uw, users ub
  WHERE uw.id = t.white AND ub.id = t.black;

ALTER TABLE v_list_games
  OWNER TO chess;
  

-- Table: com_status

-- DROP TABLE com_status;

CREATE TABLE com_status
(
  id serial NOT NULL,
  text text,
  CONSTRAINT com_status_pkey PRIMARY KEY (id )
)
WITH (
  OIDS=FALSE
);
ALTER TABLE com_status
  OWNER TO chess;
  
INSERT INTO com_status(id, text) VALUES (0, 'message');
INSERT INTO com_status(id, text) VALUES (1, 'commentaire');
INSERT INTO com_status(id, text) VALUES (2, 'bug');
INSERT INTO com_status(id, text) VALUES (3, 'bug fix');


-- Table: com

-- DROP TABLE com;

CREATE TABLE com
(
  id serial NOT NULL,
  text text,
  joueur integer,
  num_coup integer,
  game_id integer,
  date timestamp NOT NULL default '2000-01-01 00:00:00.000000+02',
  status_id integer NOT NULL DEFAULT 0,
  CONSTRAINT com_pkey PRIMARY KEY (id ),
  CONSTRAINT com_game_id_fkey FOREIGN KEY (game_id)
      REFERENCES games (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT com_joueur_fkey FOREIGN KEY (joueur)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT com_status_id_fkey FOREIGN KEY (status_id)
      REFERENCES com_status (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE com
  OWNER TO chess;

--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

insert into users(id, login, date_create, confirmed) values (0, 'admin', now(), true);
INSERT INTO games (white, black, winner, date, id) values(0,0,0, now(), 0);



-- Table: rappel

-- DROP TABLE rappel;

CREATE TABLE rappel
(
  id serial NOT NULL,
  game_id integer,
  joueur_id integer,
  limite integer,
  dernier_rappel timestamp NOT NULL default now(),
  CONSTRAINT rappel_pkey PRIMARY KEY (id ),
  CONSTRAINT rappel_game_id_fkey FOREIGN KEY (game_id)
      REFERENCES games (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT rappel_joueur_id_fkey FOREIGN KEY (joueur_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE rappel
  OWNER TO chess;



CREATE TABLE elo (
    id serial NOT NULL,
    user_id integer NOT NULL,
    date timestamp without time zone NOT NULL,
    elo real NOT NULL
);

ALTER TABLE public.elo OWNER TO chess;

ALTER TABLE ONLY elo
    ADD CONSTRAINT elo_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE com ADD variantes text;
ALTER TABLE com ADD vn integer;
ALTER TABLE games ADD date_end timestamp without time zone;
