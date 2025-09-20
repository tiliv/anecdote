cd docs
bundle exec jekyll build --config _config.yml,_config_dev.yml

cd ..
bin/make-qr.sh
