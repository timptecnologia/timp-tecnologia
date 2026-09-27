-- Colunas obrigatórias (NOT NULL sem default) de auth.users — para fixtures transacionais de teste.
select column_name, data_type from information_schema.columns
where table_schema = 'auth' and table_name = 'users' and is_nullable = 'NO' and column_default is null
order by ordinal_position;
