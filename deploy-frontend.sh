# Remove dist folders with dynamic names, they cannot be synced properly
aws s3 rm --recursive s3://hnh-food/css/
aws s3 rm --recursive s3://hnh-food/js/

# Sync dist and s3 bucket
aws s3 sync frontend/dist/ s3://hnh-food
