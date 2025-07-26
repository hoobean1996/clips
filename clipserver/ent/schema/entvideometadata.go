package schema

import (
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/field"
)

// EntVideoMetadata holds the schema definition for the EntVideoMetadata entity.
type EntVideoMetadata struct {
	ent.Schema
}

// Fields of the EntVideoMetadata.
func (EntVideoMetadata) Fields() []ent.Field {
	return []ent.Field{

		// 视频基本信息
		field.String("url").
			Unique().
			Comment("视频原始地址"),

		field.String("filename").
			Comment("原始文件名"),

		field.Int64("file_size").
			NonNegative().
			Comment("文件大小(字节)"),

		field.String("content_type").
			Default("video/mp4").
			Comment("文件MIME类型"),
	}
}

// Edges of the EntVideoMetadata.
func (EntVideoMetadata) Edges() []ent.Edge {
	return nil
}

func (EntVideoMetadata) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.RelayConnection(),
	}
}
