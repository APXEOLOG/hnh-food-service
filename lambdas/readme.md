### Information

This is a Typescript project which contains all lambdas for this project. 

Target [runtime](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) is `nodejs12.x`

Each lambda placed into a separate folder, which is later used as a distribution root. 

Model file `src/types/model.ts` which is shared between both lambdas is pure ts 
declaration and not required at the runtime
