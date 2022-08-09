commit_message=$(git show --no-patch --format=%B)

# shellcheck disable=SC2076
if [[ $commit_message =~ '\[MAJOR\]\ .+' ]]; then
  npm run major-version
elif [[ $commit_message =~ '\[MINOR\]\ .+' ]]; then
  npm run minor-version
elif [[ $commit_message =~ '\[PATCH\]\ .+' ]]; then
  npm run patch-version
fi
