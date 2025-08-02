build:
	go generate ./
	graphql-schema-utilities -s ./ent.graphql ./ent.mutation.graphql  -o ../www/src/schema.graphql
	graphql-schema-utilities -s ./ent.graphql ./ent.mutation.graphql  -o ../mobile/app/schema.graphql