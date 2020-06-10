FROM node
ENV PORT=50051
EXPOSE ${PORT}
WORKDIR /app
COPY food-vendor/ ./food-vendor
COPY tsconfig.base.json .
COPY proto ./proto
COPY data ./data
WORKDIR /app/food-vendor
RUN ["npm", "install"]
RUN ["npm", "run", "build"]
CMD ["npm", "start"]