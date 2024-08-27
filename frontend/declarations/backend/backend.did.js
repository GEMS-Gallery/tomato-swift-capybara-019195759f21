export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Tweet = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'userId' : IDL.Text,
    'timestamp' : Time,
  });
  const Result_1 = IDL.Variant({ 'ok' : Tweet, 'err' : IDL.Text });
  const UserProfile = IDL.Record({
    'bio' : IDL.Text,
    'userId' : IDL.Text,
    'name' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : UserProfile, 'err' : IDL.Text });
  return IDL.Service({
    'createTweet' : IDL.Func([IDL.Text, IDL.Text], [Result_1], []),
    'getAllTweets' : IDL.Func([], [IDL.Vec(Tweet)], ['query']),
    'getUserProfile' : IDL.Func([IDL.Text], [IDL.Opt(UserProfile)], ['query']),
    'updateUserProfile' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
