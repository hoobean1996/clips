/**
 * @generated SignedSource<<99ae489b8faaf02d4effa5dafc91bf49>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClipResultQuery$variables = Record<PropertyKey, never>;
export type ClipResultQuery$data = {
  readonly entClipMetadataSlice: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"ClipResultCard_clipMetadata">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly totalCount: number;
  };
};
export type ClipResultQuery = {
  response: ClipResultQuery$data;
  variables: ClipResultQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ClipResultQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "EntClipMetadataConnection",
        "kind": "LinkedField",
        "name": "entClipMetadataSlice",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ClipResultCard_clipMetadata"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ClipResultQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "EntClipMetadataConnection",
        "kind": "LinkedField",
        "name": "entClipMetadataSlice",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3bc10a64993caa59d9650e2d589b1e70",
    "id": null,
    "metadata": {},
    "name": "ClipResultQuery",
    "operationKind": "query",
    "text": "query ClipResultQuery {\n  entClipMetadataSlice {\n    totalCount\n    edges {\n      node {\n        ...ClipResultCard_clipMetadata\n        id\n      }\n    }\n  }\n}\n\nfragment ClipResultCard_clipMetadata on EntClipMetadata {\n  id\n  filename\n  fileURL\n  fileSize\n  duration\n  format\n  word\n  sentence\n  thumbnail\n}\n"
  }
};
})();

(node as any).hash = "a9724f4e30af1868e0a38f8d9d5a6e43";

export default node;
