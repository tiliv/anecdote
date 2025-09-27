#!/usr/bin/env sh

echo "Inspecting docs/_data/node_modules.yml..."
ruby <<'RUBY'
require 'yaml'
map = YAML.load_file('docs/_data/node_modules.yml')
map.each do |pkg, files|
  files.each do |src, urlpath|
    src_path = File.join("node_modules", pkg, src)
    dst_path = File.join("docs", urlpath)
    puts "Copying #{src_path} → #{dst_path}"
    system("cp", src_path, dst_path)
  end
end
RUBY
