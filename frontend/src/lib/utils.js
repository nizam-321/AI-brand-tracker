// import { clsx } from "clsx";
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs) {
//   return twMerge(clsx(inputs));
// }


// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getSentimentColor(sentiment) {
  switch (sentiment) {
    case 'positive':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'negative':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'neutral':
      return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    default:
      return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
}

export function getSourceIcon(source) {
  const icons = {
    Twitter: '🐦',
    Reddit: '🤖',
    News: '📰',
    Blogs: '📝',
    Forums: '💬',
    YouTube: '📺',
    Instagram: '📷',
  };
  return icons[source] || '🌐';
}