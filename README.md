# Useful script for 'redis' service

This Useful Script creates a redis server based on a Docker Image.
You don't have know docker to use this solution.

## Installing

```bash
npm install -g @usdocker/usdocker # Install it first
npm install -g @usdocker/redis
usdocker -r    # Update USDocker database
```

## Start the redis service

```bash
usdocker redis up
```

## Stop the redis service

```bash
usdocker redis down
```

## Check the redis status

```bash
usdocker redis status
```

## Connect to the redis command line client

```bash
usdocker redis client -- [args]
```

## Connect to the redis desktop manager (only Linux)

```bash
usdocker redis rdm && /tmp/rdm.sh
```



## Customize your service

You can setup the variables by using:

```bash
usdocker redis --set variable=value
```

Default values

 - image: "redis:3-alpine",
 - rdmImage: "benoitg/redis-desktop-manager"
 - folder: "$HOME/.usdocker/data/redis",
 - port: 6379

## Customize $HOME/.usdocker/setup/redis/conf/redis.conf

You can setup your redis by setup the file "redis.conf".

Note that default configuration requires the password "`password`".

You can just changed the "`requirepass`" field. 

