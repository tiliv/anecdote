
if [ "$1" = "--qr" ]; then
  CONFIG=,_config_qr.yml
else
  CONFIG=,_config_dev.yml
fi

echo "Minifying crypto.js for inlining..."
bin/minify-crypto.sh "$@"

cd docs
echo "Building site with additional _config_dev.yml..."
bundle exec jekyll build -q --config _config.yml$CONFIG
cd ..
