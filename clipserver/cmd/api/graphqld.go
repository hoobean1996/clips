package main

import (
	"context"
	"errors"
	"net/http"
	"runtime/debug"
	"time"

	"com.gigaboo/clipserver"
	"com.gigaboo/clipserver/ent"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/google/logger"
	"github.com/gorilla/websocket"
)

func CreateGraphQLServer(client *ent.Client) *handler.Server {
	srv := handler.New(clipserver.NewExecutableSchema(clipserver.Config{
		Resolvers: &clipserver.Resolver{
			Client: client.Debug(),
		},
	}))

	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	})

	srv.AddTransport(transport.MultipartForm{
		MaxMemory:     32 << 20, // 32MB
		MaxUploadSize: 50 << 20, // 50MB
	})
	srv.AddTransport(transport.POST{})

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})
	srv.SetRecoverFunc(func(ctx context.Context, err interface{}) error {
		stackTrace := debug.Stack()
		logger.Errorf("GraphQL server paniced, err: %v\nStacktrace: %s", err, stackTrace)
		return errors.New("internal server error")
	})
	return srv
}
