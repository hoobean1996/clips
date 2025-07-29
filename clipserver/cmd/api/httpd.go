package main

import (
	"time"

	"com.gigaboo/clipserver/ent"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/rs/cors"
)

func CreateChiRouter(client *ent.Client) *chi.Mux {
	router := chi.NewRouter()
	router.Use(cors.New(defaultCorsOptions()).Handler)

	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Handle("/graphiql", playground.Handler("Gigahub", "/graphql"))
	graphqlServer := CreateGraphQLServer(client)
	router.With(
		middleware.Timeout(time.Duration(30)*time.Second),
		// httprate.LimitByIP(
		// 	10,
		// 	time.Duration(1)*time.Minute,
		// ),
	).Route("/graphql", func(r chi.Router) {
		r.Handle("/", graphqlServer)
	})
	return router
}

func defaultCorsOptions() cors.Options {
	return cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		Debug:            false,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "X-Requested-With", "Accept"},
	}
}
