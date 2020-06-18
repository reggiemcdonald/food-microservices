FROM node
ENV PORT=8080
EXPOSE ${PORT}
WORKDIR /app
COPY food-finder ./food-finder
COPY tsconfig.base.json .
COPY data ./data
COPY proto ./proto
WORKDIR /app/food-finder
RUN ["npm", "install"]
RUN ["npm", "run", "build"]
CMD ["npm", "start"]
