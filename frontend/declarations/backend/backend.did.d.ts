import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'ok' : UserProfile } |
  { 'err' : string };
export type Result_1 = { 'ok' : Tweet } |
  { 'err' : string };
export type Time = bigint;
export interface Tweet {
  'id' : bigint,
  'content' : string,
  'userId' : string,
  'timestamp' : Time,
}
export interface UserProfile {
  'bio' : string,
  'userId' : string,
  'name' : string,
}
export interface _SERVICE {
  'createTweet' : ActorMethod<[string, string], Result_1>,
  'getAllTweets' : ActorMethod<[], Array<Tweet>>,
  'getUserProfile' : ActorMethod<[string], [] | [UserProfile]>,
  'updateUserProfile' : ActorMethod<[string, string, string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
