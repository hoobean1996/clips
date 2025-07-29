/**
 * @generated SignedSource<<f585acbe143f4659f33a265f6b3a9019>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClipResultQuery_clipMetadata$data = {
  readonly duration: number;
  readonly fileSize: number;
  readonly fileURL: string;
  readonly filename: string;
  readonly format: string;
  readonly id: string;
  readonly " $fragmentType": "ClipResultQuery_clipMetadata";
};
export type ClipResultQuery_clipMetadata$key = {
  readonly " $data"?: ClipResultQuery_clipMetadata$data;
  readonly " $fragmentSpreads": FragmentRefs<"ClipResultQuery_clipMetadata">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClipResultQuery_clipMetadata",
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

(node as any).hash = "53f02b8a4ef6b365169e6ca0b490c2c5";

export default node;
