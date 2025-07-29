/**
 * @generated SignedSource<<fb38eb850d625a63491dcadd03568be1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClipResultCard_clipMetadata$data = {
  readonly duration: number;
  readonly fileSize: number;
  readonly fileURL: string;
  readonly filename: string;
  readonly format: string;
  readonly id: string;
  readonly " $fragmentType": "ClipResultCard_clipMetadata";
};
export type ClipResultCard_clipMetadata$key = {
  readonly " $data"?: ClipResultCard_clipMetadata$data;
  readonly " $fragmentSpreads": FragmentRefs<"ClipResultCard_clipMetadata">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClipResultCard_clipMetadata",
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
    }
  ],
  "type": "EntClipMetadata",
  "abstractKey": null
};

(node as any).hash = "dba97f0437fb163b18bd6d9df9158c7b";

export default node;
