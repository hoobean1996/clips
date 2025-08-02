/**
 * @generated SignedSource<<81fc3d0db36f042719e07020a0691a86>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EntClipMetadataWhereInput = {
  and?: ReadonlyArray<EntClipMetadataWhereInput> | null | undefined;
  duration?: number | null | undefined;
  durationGT?: number | null | undefined;
  durationGTE?: number | null | undefined;
  durationIn?: ReadonlyArray<number> | null | undefined;
  durationLT?: number | null | undefined;
  durationLTE?: number | null | undefined;
  durationNEQ?: number | null | undefined;
  durationNotIn?: ReadonlyArray<number> | null | undefined;
  fileSize?: number | null | undefined;
  fileSizeGT?: number | null | undefined;
  fileSizeGTE?: number | null | undefined;
  fileSizeIn?: ReadonlyArray<number> | null | undefined;
  fileSizeLT?: number | null | undefined;
  fileSizeLTE?: number | null | undefined;
  fileSizeNEQ?: number | null | undefined;
  fileSizeNotIn?: ReadonlyArray<number> | null | undefined;
  fileURL?: string | null | undefined;
  fileURLContains?: string | null | undefined;
  fileURLContainsFold?: string | null | undefined;
  fileURLEqualFold?: string | null | undefined;
  fileURLGT?: string | null | undefined;
  fileURLGTE?: string | null | undefined;
  fileURLHasPrefix?: string | null | undefined;
  fileURLHasSuffix?: string | null | undefined;
  fileURLIn?: ReadonlyArray<string> | null | undefined;
  fileURLLT?: string | null | undefined;
  fileURLLTE?: string | null | undefined;
  fileURLNEQ?: string | null | undefined;
  fileURLNotIn?: ReadonlyArray<string> | null | undefined;
  filename?: string | null | undefined;
  filenameContains?: string | null | undefined;
  filenameContainsFold?: string | null | undefined;
  filenameEqualFold?: string | null | undefined;
  filenameGT?: string | null | undefined;
  filenameGTE?: string | null | undefined;
  filenameHasPrefix?: string | null | undefined;
  filenameHasSuffix?: string | null | undefined;
  filenameIn?: ReadonlyArray<string> | null | undefined;
  filenameLT?: string | null | undefined;
  filenameLTE?: string | null | undefined;
  filenameNEQ?: string | null | undefined;
  filenameNotIn?: ReadonlyArray<string> | null | undefined;
  format?: string | null | undefined;
  formatContains?: string | null | undefined;
  formatContainsFold?: string | null | undefined;
  formatEqualFold?: string | null | undefined;
  formatGT?: string | null | undefined;
  formatGTE?: string | null | undefined;
  formatHasPrefix?: string | null | undefined;
  formatHasSuffix?: string | null | undefined;
  formatIn?: ReadonlyArray<string> | null | undefined;
  formatLT?: string | null | undefined;
  formatLTE?: string | null | undefined;
  formatNEQ?: string | null | undefined;
  formatNotIn?: ReadonlyArray<string> | null | undefined;
  id?: string | null | undefined;
  idGT?: string | null | undefined;
  idGTE?: string | null | undefined;
  idIn?: ReadonlyArray<string> | null | undefined;
  idLT?: string | null | undefined;
  idLTE?: string | null | undefined;
  idNEQ?: string | null | undefined;
  idNotIn?: ReadonlyArray<string> | null | undefined;
  not?: EntClipMetadataWhereInput | null | undefined;
  or?: ReadonlyArray<EntClipMetadataWhereInput> | null | undefined;
  sentence?: string | null | undefined;
  sentenceContains?: string | null | undefined;
  sentenceContainsFold?: string | null | undefined;
  sentenceEqualFold?: string | null | undefined;
  sentenceGT?: string | null | undefined;
  sentenceGTE?: string | null | undefined;
  sentenceHasPrefix?: string | null | undefined;
  sentenceHasSuffix?: string | null | undefined;
  sentenceIn?: ReadonlyArray<string> | null | undefined;
  sentenceLT?: string | null | undefined;
  sentenceLTE?: string | null | undefined;
  sentenceNEQ?: string | null | undefined;
  sentenceNotIn?: ReadonlyArray<string> | null | undefined;
  thumbnail?: string | null | undefined;
  thumbnailContains?: string | null | undefined;
  thumbnailContainsFold?: string | null | undefined;
  thumbnailEqualFold?: string | null | undefined;
  thumbnailGT?: string | null | undefined;
  thumbnailGTE?: string | null | undefined;
  thumbnailHasPrefix?: string | null | undefined;
  thumbnailHasSuffix?: string | null | undefined;
  thumbnailIn?: ReadonlyArray<string> | null | undefined;
  thumbnailLT?: string | null | undefined;
  thumbnailLTE?: string | null | undefined;
  thumbnailNEQ?: string | null | undefined;
  thumbnailNotIn?: ReadonlyArray<string> | null | undefined;
  word?: string | null | undefined;
  wordContains?: string | null | undefined;
  wordContainsFold?: string | null | undefined;
  wordEqualFold?: string | null | undefined;
  wordGT?: string | null | undefined;
  wordGTE?: string | null | undefined;
  wordHasPrefix?: string | null | undefined;
  wordHasSuffix?: string | null | undefined;
  wordIn?: ReadonlyArray<string> | null | undefined;
  wordLT?: string | null | undefined;
  wordLTE?: string | null | undefined;
  wordNEQ?: string | null | undefined;
  wordNotIn?: ReadonlyArray<string> | null | undefined;
};
export type ClipResultGridContainerQuery$variables = {
  count?: number | null | undefined;
  cursor?: any | null | undefined;
  where: EntClipMetadataWhereInput;
};
export type ClipResultGridContainerQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"ClipResultGridContainer_clip">;
};
export type ClipResultGridContainerQuery = {
  response: ClipResultGridContainerQuery$data;
  variables: ClipResultGridContainerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": 5,
    "kind": "LocalArgument",
    "name": "count"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cursor"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "where"
  }
],
v1 = {
  "kind": "Variable",
  "name": "where",
  "variableName": "where"
},
v2 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  },
  (v1/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ClipResultGridContainerQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "count",
            "variableName": "count"
          },
          {
            "kind": "Variable",
            "name": "cursor",
            "variableName": "cursor"
          },
          (v1/*: any*/)
        ],
        "kind": "FragmentSpread",
        "name": "ClipResultGridContainer_clip"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ClipResultGridContainerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "EntClipMetadataConnection",
        "kind": "LinkedField",
        "name": "entClipMetadataSlice",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "totalCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "EntClipMetadataEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EntClipMetadata",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "filename",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "fileURL",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "fileSize",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "duration",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "format",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "word",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "sentence",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "thumbnail",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cursor",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PageInfo",
            "kind": "LinkedField",
            "name": "pageInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endCursor",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "hasNextPage",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
        "filters": [
          "where"
        ],
        "handle": "connection",
        "key": "ClipResultGridContainerQuery_entClipMetadataSlice",
        "kind": "LinkedHandle",
        "name": "entClipMetadataSlice"
      }
    ]
  },
  "params": {
    "cacheID": "fbcb387b14b82fdabfee9217121668e9",
    "id": null,
    "metadata": {},
    "name": "ClipResultGridContainerQuery",
    "operationKind": "query",
    "text": "query ClipResultGridContainerQuery(\n  $count: Int = 5\n  $cursor: Cursor\n  $where: EntClipMetadataWhereInput!\n) {\n  ...ClipResultGridContainer_clip_mjR8k\n}\n\nfragment ClipResultCard_clipMetadata on EntClipMetadata {\n  id\n  filename\n  fileURL\n  fileSize\n  duration\n  format\n  word\n  sentence\n  thumbnail\n}\n\nfragment ClipResultGridContainer_clip_mjR8k on Query {\n  entClipMetadataSlice(first: $count, after: $cursor, where: $where) {\n    totalCount\n    edges {\n      node {\n        ...ClipResultCard_clipMetadata\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6346b8d8fd3331c25143278c5acfc3b6";

export default node;
