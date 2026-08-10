"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { posts } from "@/lib/content";
import { openLink } from "@/lib/system";

/** Posts open in their own windows, since the blog allows embedding. */
export default function JournalApp() {
  return (
    <div className="flex min-h-full flex-col p-5 @md:p-6">
      <div className="flex-1">
        {posts.map((post, i) => (
          <button
            key={post.title}
            onClick={() => openLink(post.href, post.title)}
            className={`group block w-full py-4 text-left ${
              i < posts.length - 1 ? "border-b border-white/[0.07]" : ""
            }`}
          >
            <p className="text-[11.5px] font-medium text-accent-300">{post.category}</p>
            <h2 className="mt-1 flex items-start gap-1.5 text-[15px] font-semibold leading-snug tracking-tight text-white/90 transition-colors group-hover:text-accent-200">
              {post.title}
              <ArrowUpRight
                size={14}
                weight="bold"
                className="mt-1 shrink-0 text-accent-300 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </h2>
            <p className="mt-1.5 max-w-prose text-[13px] leading-relaxed text-white/60">
              {post.excerpt}
            </p>
            <p className="mt-2 text-[12px] text-white/40">
              {post.date} · {post.readTime}
            </p>
          </button>
        ))}
      </div>

      <footer className="mt-4 border-t border-white/[0.07] pt-4">
        <button
          onClick={() => openLink("https://www.diwakaryadav.com.np/blog/")}
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent-300 transition-colors hover:text-accent-200"
        >
          Browse all posts on the blog
          <ArrowUpRight size={13} weight="bold" />
        </button>
      </footer>
    </div>
  );
}
