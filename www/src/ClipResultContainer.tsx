import ClipEmptyResult from "./ClipEmptyResult";
import ClipResult from "./ClipResult";

export default function ClipResultContainer({ query }: { query: string }) {
  if (query === "") {
    return <ClipEmptyResult />;
  }
  return <ClipResult keyword={query} />;
}
