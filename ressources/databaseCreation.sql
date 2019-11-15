set search_path TO "cloud-provider-kubernetes"

CREATE TABLE flavour
(
    id          SERIAL PRIMARY KEY,
    name        varchar(250) NOT NULL,
    description varchar(2500),
    cpu         float        NOT NULL,
    memory      integer      NOT NULL
);
create index flavour_id_index on flavour (id);
create index flavour_name_index on flavour (name);


CREATE TABLE image
(
    id          SERIAL PRIMARY KEY,
    name        varchar(250) NOT NULL,
    description varchar(2500)
);
create index image_id_index on image (id);
create index image_name_index on image (name);


CREATE TABLE instance
(
    id            serial PRIMARY KEY,
    name          varchar(250) NOT NULL,
    description   varchar(2500),
    image_id      integer REFERENCES image (id),
    flavour_id    integer REFERENCES flavour (id),
    hostname      varchar(128) NOT NULL,
    state         varchar(50)  NOT NULL,
    currentCpu    float        NOT NULL,
    currentMemory integer      NOT NULL,
    createdAt     date         NOT NULL
);
create index instance_id_index on instance (id);
create index instance_name_index on instance (name);


CREATE TABLE instance_service
(
    id          SERIAL PRIMARY KEY,
    name        varchar(250) NOT NULL,
    port        integer      NOT NULL,
    instance_id integer REFERENCES instance (id)
);
create index instance_service_id_index on instance_service (id);
create index instance_service_name_index on instance_service (name);
