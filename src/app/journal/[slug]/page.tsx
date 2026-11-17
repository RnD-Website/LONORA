import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPost, posts } from "@/lib/content";
import Article from "./Article";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default function PostPage(props: PageProps<"/journal/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-bone" />}>
      <PostBody params={props.params} />
    </Suspense>
  );
}

async function PostBody({ params }: { params: PageProps<"/journal/[slug]">["params"] }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const next = posts[(posts.indexOf(post) + 1) % posts.length];
  return <Article post={post} next={next} />;
}
