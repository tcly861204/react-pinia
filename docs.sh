cd dist
cp -f ../packages/docs/assets/favicon.png assets/favicon.png
git init
git add .
git commit -m "feat: init docs"
git branch gh-pages
git checkout gh-pages
git remote add origin https://github.com/tcly861204/react-pinia.git
git push origin gh-pages --force
cd ..
rm -rf dist