import { useState, useEffect } from 'react';
import { Story, User, PollResult } from '../models/types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export function useFeed(feedType: string, page: number) {
  const [items, setItems] = useState<Story[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(null);
    setError('');
    fetch(`${BASE_URL}/${feedType}?page=${page}`)
      .then(res => res.json())
      .then((data: Story[]) => {
        setItems(data);
        window.scrollTo(0, 0);
      })
      .catch(() => setError(`Could not load ${feedType} stories.`));
  }, [feedType, page]);

  return { items, error };
}

export function useItemContent(id: number) {
  const [item, setItem] = useState<Story | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setItem(null);
    setError('');
    fetch(`${BASE_URL}/item/${id}`)
      .then(res => res.json())
      .then(async (story: Story) => {
        if (story.type === 'poll' && story.poll) {
          const numberOfPollOptions = story.poll.length;
          story.poll_votes_count = 0;
          for (let i = 1; i <= numberOfPollOptions; i++) {
            try {
              const pollRes = await fetch(`${BASE_URL}/item/${story.id + i}`);
              const pollResult: PollResult = await pollRes.json();
              story.poll[i - 1] = pollResult;
              story.poll_votes_count += pollResult.points;
            } catch {
              // skip failed poll fetch
            }
          }
        }
        setItem(story);
      })
      .catch(() => setError('Could not load item comments.'));
    window.scrollTo(0, 0);
  }, [id]);

  return { item, error };
}

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setUser(null);
    setError('');
    fetch(`${BASE_URL}/user/${id}`)
      .then(res => res.json())
      .then((data: User) => setUser(data))
      .catch(() => setError(`Could not load user ${id}.`));
  }, [id]);

  return { user, error };
}
