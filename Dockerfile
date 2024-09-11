# Use the official Node.js 18.20 image for the ARM architecture (compatible with Mac M1)
FROM --platform=linux/amd64 node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock files to the working directory
COPY package*.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN yarn build

RUN ls -la dist/src

# Expose the desired port (e.g., 3000)
EXPOSE 3000

# Command to run the application
CMD ["yarn", "start"]
