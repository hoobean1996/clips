import { graphql, usePaginationFragment } from "react-relay";

import {
  ClipResultGridContainer_clip$data,
  ClipResultGridContainer_clip$key,
} from "../graphql/__generated__/ClipResultGridContainer_clip.graphql";
import ClipResultCard from "./ClipResultCard";
import XDSGrid from "./XDSGrid";

type Props = {
  fragmentKey: ClipResultGridContainer_clip$key;
};

const fragment = graphql`
  fragment ClipResultGridContainer_clip on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 5 }
    cursor: { type: "Cursor" }
    where: { type: "EntClipMetadataWhereInput!" }
  )
  @refetchable(queryName: "ClipResultGridContainerQuery") {
    entClipMetadataSlice(first: $count, after: $cursor, where: $where)
      @connection(key: "ClipResultGridContainerQuery_entClipMetadataSlice") {
      totalCount
      edges {
        node {
          ...ClipResultCard_clipMetadata
        }
      }
    }
  }
`;

type TItem = NonNullable<
  NonNullable<
    ClipResultGridContainer_clip$data["entClipMetadataSlice"]["edges"]
  >[number]
>["node"];

export default function ClipResultGridContainer({ fragmentKey }: Props) {
  const {
    data,
    loadNext,
    loadPrevious,
    hasNext,
    hasPrevious,
    isLoadingNext,
    isLoadingPrevious,
    refetch,
  } = usePaginationFragment(fragment, fragmentKey);
  const items: TItem[] = (data.entClipMetadataSlice.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node) => node != null);
  return (
    <XDSGrid
      data={items}
      renderItem={(item: TItem) => {
        if (item == null) {
          return null;
        }
        return <ClipResultCard fragmentKey={item} />;
      }}
      pagination={{
        loadNext,
        loadPrevious,
        hasNext,
        hasPrevious,
        isLoadingNext,
        isLoadingPrevious,
        refetch,
      }}
      actions={[]}
      onItemClick={() => {}}
    />
  );
}
