import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'ok' : UserProfile } |
  { 'err' : string };
export type Result_1 = { 'ok' : Tweet } |
  { 'err' : string };
export type Result_2 = { 'ok' : null } |
  { 'err' : string };
export type Time = bigint;
export interface Tweet {
  'id' : TweetId,
  'retweets' : bigint,
  'content' : string,
  'author' : UserId,
  'likes' : bigint,
  'timestamp' : Time,
}
export type TweetId = bigint;
export type UserId = Principal;
export interface UserProfile {
  'bio' : string,
  'username' : string,
  'userId' : UserId,
  'followers' : Array<UserId>,
  'following' : Array<UserId>,
}
export interface _SERVICE {
  'create_tweet' : ActorMethod<[string], Result_1>,
  'follow_user' : ActorMethod<[UserId], Result_2>,
  'get_all_tweets' : ActorMethod<[], Array<Tweet>>,
  'get_user_feed' : ActorMethod<[UserId], Array<Tweet>>,
  'get_user_profile' : ActorMethod<[UserId], Result>,
  'like_tweet' : ActorMethod<[TweetId], Result_1>,
  'retweet' : ActorMethod<[TweetId], Result_1>,
  'update_user_profile' : ActorMethod<[string, string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
