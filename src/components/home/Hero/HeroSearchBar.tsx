"use client";

import dynamic from "next/dynamic";
import { SearchBarSkeleton } from "./SearchBarSkeleton";

const SearchBar = dynamic(
  () => import("./SearchBar").then((mod) => mod.SearchBar),
  {
    loading: () => <SearchBarSkeleton />,
    ssr: false,
  }
);

export function HeroSearchBar() {
  return <SearchBar />;
}
