package schema

import (
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/field"
)

// EntClipMetadata holds the schema definition for the EntClipMetadata entity.
type EntClipMetadata struct {
	ent.Schema
}

// Fields of the EntClipMetadata.
func (EntClipMetadata) Fields() []ent.Field {
	return []ent.Field{
		// 文件基本信息
		field.String("filename").
			NotEmpty().
			Comment("剪辑文件名"),

		field.String("file_url").
			NotEmpty().
			Comment("剪辑文件访问地址"),

		field.Int64("file_size").
			NonNegative().
			Comment("文件大小（字节）"),

		// 视频基本属性
		field.Int("duration").
			Positive().
			Comment("视频时长（秒）"),

		field.String("format").
			Default("mp4").
			Comment("视频格式"),

		field.String("word").Nillable(),
		field.String("sentence").Nillable(),
	}
}

// Edges of the EntClipMetadata.
func (EntClipMetadata) Edges() []ent.Edge {
	return nil
}

func (EntClipMetadata) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.RelayConnection(),
	}
}
