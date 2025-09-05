# 初始化项目
npm init -y 
# 设置 package.json 的基本信息
npm pkg set author="Leo" license="MIT" version="1.0.0" main="dist/index.js"

# 安装开发依赖
npm install -D typescript tsx @types/node nodemon @graphql-codegen/cli @types/express @types/cors @types/body-parser @types/lodash jest shx ts-jest @types/jest supertest @types/supertest @types/jsonwebtoken @types/swagger-jsdoc @types/swagger-ui-express
# eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-standard

# 安装生产依赖
npm install express @apollo/server graphql dotenv body-parser cors bcryptjs lodash dayjs jsonwebtoken couchbase winston winston-daily-rotate-file swagger-jsdoc swagger-ui-express \
  @graphql-tools/merge @graphql-tools/load-files graphql-shield

# 初始化 GraphQL Code Generator 配置
if [ ! -f src/codegen.ts ]; then
  npx graphql-code-generator init
else
  echo "codegen.ts already exists"
fi

# 初始化 TypeScript 配置文件
if [ ! -f tsconfig.json ]; then
  npx tsc --init --rootDir src --outDir dist --esModuleInterop --resolveJsonModule --lib ES2020,DOM --module commonjs --target ES2020 --noImplicitAny true --moduleResolution node --sourceMap true --skipLibCheck true --forceConsistentCasingInFileNames true
else
  echo "tsconfig.json already exists"
fi

# 初始化 Jest 配置文件
if [ ! -f jest.config.ts ]; then
    npx ts-jest config:init
else
    echo "jest.config.ts already exists"
fi

# # 初始化 ESLint 配置文件
# if [ ! -f .eslintrc.json ]; then
#     npx eslint --init
# else
#     echo ".eslintrc.json already exists"
# fi


# 创建必要的目录和文件
mkdir -p src docs config/env  && cd src && mkdir -p entities services rest graphql middleware common database tests && cd rest/ && mkdir -p controllers middlewares validators && cd ../graphql/ && mkdir -p resolvers schemas middleware generated && 
cd ../common && mkdir -p types utils errors constants config && 
cd ../../ && touch src/index.ts src/tests/sample.test.ts docs/README.md .env


