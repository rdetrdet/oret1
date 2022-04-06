create table DASHBOARD (
  ID                 varchar(22)              not null,
  CREATED_ON         timestamp with time zone not null,
  REALM              varchar(255)             not null,
  VERSION            int8                     not null,
  OWNER_ID           varchar(22)              not null,
  DISPLAY_NAME       varchar(255)             not null,
  TEMPLATE           jsonb                    not null,
  primary key (ID)
);