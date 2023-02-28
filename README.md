### mikugg
Please look at the [documentation](https://docs.miku.gg/)

#### build
```
pnpm install
pnpm build
```

### run
```bash
pnpm run

# hotfix for vite not refreshing deps
# need to restart the app with this command if you edit the deps under package/ 
rm -rf apps/browser-chat/node_modules/.vite && pnpm start 
```

# Pull new changes
To sync with the lastest version from git, just run
```bash
pnpm pull
```


#### publish
```bash
# publish public packages to npm
npx lerna publish
```