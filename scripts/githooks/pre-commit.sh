if ! which npm > /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

npm run lint
npm run build