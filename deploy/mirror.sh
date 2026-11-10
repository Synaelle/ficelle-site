#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# Keeps a copy of Ficelle's downloads in a folder the site serves at
# /site/mirror/, for when GitHub cannot be reached: the latest release and
# the newest build of either kind (a beta, or the release when no beta is
# newer). Each file is checked against the checksum GitHub gives for it.
# mirror.json lists both in GitHub's own shape, its links on the mirror.
#
# A failed run changes nothing: a new version is downloaded beside the old
# one and only listed once complete, and older versions go after that.
#
#   mirror.sh <folder>
set -euo pipefail
umask 022

dir=${1:?usage: mirror.sh <folder>}
api=https://api.github.com/repos/Synaelle/ficelle
# the files the download menu offers
wanted='(_x64-setup\.exe|_x64_portable\.exe|_amd64\.AppImage|-android\.apk|_universal\.dmg)$'

mkdir -p "$dir"
work=$(mktemp -d "$dir/.sync.XXXXXX")
trap 'rm -rf "$work"' EXIT

ask() {
  curl -fsS --max-time 30 --retry 2 -H 'accept: application/vnd.github+json' "$api/$1"
}

echo "asking GitHub for the releases"
ask releases/latest > "$work/stable.json"
ask 'releases?per_page=30' | jq '
  [.[] | select(.draft | not)
       | select(.tag_name | test("^v[0-9]+\\.[0-9]+\\.[0-9]+(-beta\\.[0-9]+)?$"))]
  | max_by(.tag_name | capture("^v(?<a>[0-9]+)\\.(?<b>[0-9]+)\\.(?<c>[0-9]+)(-beta\\.(?<d>[0-9]+))?$")
      | [(.a | tonumber), (.b | tonumber), (.c | tonumber), (if .d then .d | tonumber else infinite end)])
' > "$work/newest.json"

# copies one release into $dir/<tag>/ unless it is already complete there
fetch() {
  local release=$1 tag
  tag=$(jq -r .tag_name "$release")
  [[ $tag =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$ ]] || { echo "unexpected tag $tag" >&2; return 1; }
  if [[ -e $dir/$tag/.complete ]]; then
    echo "$tag already mirrored"
    return
  fi
  local into=$work/$tag
  mkdir -p "$into"
  jq -r --arg wanted "$wanted" '.assets[] | select(.name | test($wanted))
    | [.name, .browser_download_url, (.digest // "")] | @tsv' "$release" |
    while IFS=$'\t' read -r name url digest; do
      [[ $digest == sha256:* ]] || { echo "$tag/$name has no checksum on GitHub" >&2; return 1; }
      echo "downloading $tag/$name"
      curl -fsSL --max-time 1800 --retry 3 -o "$into/$name" "$url"
      echo "${digest#sha256:}  $into/$name" | sha256sum -c --quiet
    done
  touch "$into/.complete"
  chmod 755 "$into"
  rm -rf "${dir:?}/$tag"
  mv "$into" "$dir/$tag"
  echo "$tag mirrored"
}

fetch "$work/stable.json"
fetch "$work/newest.json"

# the list the site reads, swapped in whole
jq -n --slurpfile stable "$work/stable.json" --slurpfile newest "$work/newest.json" \
  --arg wanted "$wanted" '
  def mirrored: .tag_name as $tag | {tag_name, assets: [.assets[] | select(.name | test($wanted))
    | {name, browser_download_url: "/site/mirror/\($tag)/\(.name)"}]};
  {checked: (now | todate), stable: ($stable[0] | mirrored), newest: ($newest[0] | mirrored)}
' > "$work/mirror.json"
chmod 644 "$work/mirror.json"
mv -f "$work/mirror.json" "$dir/mirror.json"

# versions no longer listed
keep=" $(jq -r .tag_name "$work/stable.json") $(jq -r .tag_name "$work/newest.json") "
for old in "$dir"/v*/; do
  [[ -d $old ]] || continue
  tag=$(basename "$old")
  if [[ $keep != *" $tag "* ]]; then
    rm -rf "$old"
    echo "removed $tag"
  fi
done
echo "mirror up to date"
