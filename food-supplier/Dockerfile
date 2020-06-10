FROM node
ENV PORT=50052
EXPOSE ${PORT}
WORKDIR /app
COPY food-supplier/ ./food-supplier
COPY tsconfig.base.json .
COPY proto ./proto
COPY data ./data
WORKDIR /app/food-supplier
RUN ["npm", "install"]
RUN ["npm", "run", "build"]
CMD ["npm", "start"]