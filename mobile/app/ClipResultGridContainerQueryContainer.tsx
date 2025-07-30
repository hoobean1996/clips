import React from "react";

import { graphql, useLazyLoadQuery } from "react-relay";

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

type Props = {
  keyword: string;
};

export default function ClipResultContainerQueryContainer({ keyword }: Props) {
  const data = useLazyLoadQuery<ClipResultGridContainerQueryContainerQuery>(
    query,
    {
      count: 5,
      where: {
        filenameContains: keyword,
      },
    },
    { fetchPolicy: "network-only" }
  );

  return <ClipResultGridContainer fragmentKey={data.clips} />;
}
