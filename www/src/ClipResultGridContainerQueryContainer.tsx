import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import ClipResultGridContainer from "./ClipResultGridContainer";
import { ClipResultGridContainerQueryContainerQuery } from "./__generated__/ClipResultGridContainerQueryContainerQuery.graphql";

const query = graphql`
  query ClipResultGridContainerQueryContainerQuery(
    $count: Int!
    $cursor: Cursor
    $where: EntClipMetadataWhereInput!
  ) {
    ...ClipResultGridContainer_clip
      @arguments(count: $count, cursor: $cursor, where: $where)
      @alias(as: "clips")
  }
`;

export default function ClipResultContainerQueryContainer({
  q,
}: {
  q: string;
}) {
  const data = useLazyLoadQuery<ClipResultGridContainerQueryContainerQuery>(
    query,
    {
      count: 5,
      where: {
        filenameContains: q,
      },
    },
    { fetchPolicy: "network-only" }
  );

  return <ClipResultGridContainer fragmentKey={data.clips} />;
}
