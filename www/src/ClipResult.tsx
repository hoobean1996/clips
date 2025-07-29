import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { ClipResultQuery } from "./__generated__/ClipResultQuery.graphql";
import ClipResultContainerQueryContainer from "./ClipResultGridContainerQueryContainer";

interface Props {
  keyword: string;
}

const query = graphql`
  query ClipResultQuery {
    entClipMetadataSlice {
      totalCount
      edges {
        node {
          ...ClipResultCard_clipMetadata
        }
      }
    }
  }
`;

export default function ClipResult({ keyword }: Props) {
  const data = useLazyLoadQuery<ClipResultQuery>(query, {});
  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
      <div className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* 结果标题 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              🎬 视频片段
            </h2>
            {query && (
              <p className="text-gray-600 text-base mb-2">
                搜索关键词: "
                <span className="font-semibold text-blue-600">{keyword}</span>"
              </p>
            )}
            <p className="text-gray-500 text-sm">
              找到 {data.entClipMetadataSlice.totalCount ?? 0} 个相关视频片段
            </p>
          </div>

          {/* 视频卡片网格 */}
          <ClipResultContainerQueryContainer q={keyword} />
        </div>
      </div>
    </div>
  );
}
