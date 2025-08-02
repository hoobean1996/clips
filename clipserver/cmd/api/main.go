package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"com.gigaboo/clipserver/ent"
	"com.gigaboo/clipserver/ent/migrate"
	"entgo.io/ent/dialect"

	"github.com/go-chi/chi"
	"github.com/google/logger"
	_ "github.com/mattn/go-sqlite3"
)

func FileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit any URL parameters.")
	}

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(root))
		fs.ServeHTTP(w, r)
	})
}

func main() {
	// Create ent.Client and run the schema migration.
	client, err := ent.Open(dialect.SQLite, "file:clips.db?_fk=1")
	if err != nil {
		log.Fatal("opening ent client", err)
	}
	if err := client.Schema.Create(
		context.Background(),
		migrate.WithGlobalUniqueID(true),
	); err != nil {
		log.Fatal("opening ent client", err)
	}

	httpServer := CreateChiRouter(client)

	workDir, _ := os.Getwd()
	filesDir := http.Dir(filepath.Join(workDir, "clips"))
	FileServer(httpServer, "/clips", filesDir)

	if err := http.ListenAndServe(fmt.Sprintf("0.0.0.0:%d", 8081), httpServer); err != nil {
		logger.Fatalf("API服务终止,错误: %v", err)
	}
}
