/**
 * @generated SignedSource<<e8a8cb44888e1c92b00af7b3d7a53973>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TabsHomeScreenQuery$variables = Record<PropertyKey, never>;
export type TabsHomeScreenQuery$data = {
  readonly entClipMetadataSlice: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly totalCount: number;
  };
};
export type TabsHomeScreenQuery = {
  response: TabsHomeScreenQuery$data;
  variables: TabsHomeScreenQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
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
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "TabsHomeScreenQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "TabsHomeScreenQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "4009ae45fd5febf302242f2b254ebb7a",
    "id": null,
    "metadata": {},
    "name": "TabsHomeScreenQuery",
    "operationKind": "query",
    "text": "query TabsHomeScreenQuery {\n  entClipMetadataSlice {\n    totalCount\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "93349be488a4b4707a9e537177f584d8";

export default node;
