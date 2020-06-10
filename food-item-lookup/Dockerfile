FROM node
WORKDIR /app
COPY data ./data
COPY proto ./data
COPY food-item-lookup/ ./food-item-lookup
COPY tsconfig.base.json .
ENV PORT=50053
EXPOSE 50053
WORKDIR /app/food-item-lookup
RUN ["npm", "install"]
RUN ["npm", "run", "build"]
CMD ["npm", "start"]
