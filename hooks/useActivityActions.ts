"use client";

import { useState } from "react";

export function useActivityActions(initialLikes: number) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    const newLikes = isLiked ? likes - 1 : likes + 1;
    setLikes(newLikes);
    setIsLiked(!isLiked);
  };

  return {
    likes,
    isLiked,
    handleLike,
    likeLabel: isLiked ? "Curtido" : "Curtir atividade"
  };
}