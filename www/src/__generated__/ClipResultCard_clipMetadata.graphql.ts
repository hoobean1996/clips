/**
 * @generated SignedSource<<dfb083df6343a8e0f95335d51bd3c5f3>>
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
  readonly sentence: string;
  readonly word: string;
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
    }
  ],
  "type": "EntClipMetadata",
  "abstractKey": null
};

(node as any).hash = "1984ed4c4a35f18da8e61867291dbd77";

export default node;
