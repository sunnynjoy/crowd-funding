const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json')
const compiledCampaign = require('../ethereum/build/Campaign.json')

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode})
    .send({from : accounts[0], gas : '1000000'});

await factory.methods.createCampaign('100')
.send({ from : accounts[0], gas : '1000000'});

const addresses = await factory.methods.getDeployedCampigns().call();
campaignAddress = addresses[0]
campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface), 
    campaignAddress);
});

describe('Campaigns' , () => {
    it('should deploy a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('should be a manager to create a campaign', async () => {
       const actualManager = await campaign.methods.getManager().call();
       assert.equal(accounts[0], actualManager)
    });

    it('should allow people to contribute money and be an approver', async () => {
        const actualManager = await campaign.methods.contribute().send( {
            value: '200',
            from: accounts[1]
        });
        const isAContributor = await campaign.methods.approvers(accounts[1]);
        assert(isAContributor);
     });

     // TODO
     it('non contributed people should not be an approver', async () => {
        try{
            const actualManager = await campaign.methods.contribute().send( {
                value: '1',
                from: accounts[2]
            });
            assert(false)
         } catch(exception) {
            const isAContributor = await campaign.methods.approvers(accounts[2]);
            assert(isAContributor);
         }   
     });

     it('requires a minimum contribution', async () => {
        try{
           await campaign.methods.contribute().send( {
               value: '1',
               from: accounts[1]
           });
           assert(false)
        } catch(exception) {
            assert(exception)
        }
    });

    it('allow manager to make a new payment request', async () => {
        await campaign.methods.createNewRequest('lens', '100', accounts[1])
        .send({
            from: accounts[0],
            gas: '1000000'
        });
        const request = await campaign.methods.requests(0).call();
        assert.equal("lens", request.description);
     });

     it('processes request', async () => {
        await campaign.methods.contribute()
        .send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        await campaign.methods.createNewRequest('lens', web3.utils.toWei('5', 'ether'), accounts[1])
        .send({
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.approveRequest(0)
        .send({
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.finalizeRequest(0)
        .send({
            from: accounts[0],
            gas: '1000000'
        });
        
        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);
        console.log(balance)
        assert(balance > 104)
     });
});
