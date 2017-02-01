window.room=(function(){


    //colors, animals, adjectives
    var first = ("red,green,blue,black,orange,white,black,brown,purple,yellow,"+
    "ant,ape,bat,bear,beaver,buck,bug,bull,bunny,camel,canary,canine,cat,cheetah,chich,chimp,chipmunk,cow,coyote,crab,crow,cub,deer,dingo,dog,dolphin,donkey,dove,duck,eagle,elephant,falcon,fawn,fox,frog,goat,goose,gorilla,grizzly,hawk,hippo,horse,hound,hummingbird,jackrabbit,jaguar,jellyfish,kangaroo,kitten,lamb,lemming,lion,llama,mink,minnow,mockingbird,monkey,moose,mule,newt,octopus,orca,otter,owl,ox,panda,panther,parrot,peacock,pelican,penguin,pig,piglet,pony,rabbit,ram,rat,seal,sheep,skunk,sloth,snail,snake,spider,squid,squirrel,stork,swan,tadpole,tiger,toad,turkey,unicorn,walrus,wasp,whale,wolf,worm,yak,zebra").split(',');

    var last = "acre,airport,cabin,cliff,coast,crossing,fault,field,gap,glade,grove,habitat,hall,highlands,hill,horizon,inlet,island,jungle,key,land,landscape,lava,location,mulch,ocean,ooze,plateau,pole,province,reef,region,rock,sediment,site,swamp,tropic,tundra,urban,volcano,weeds,wetlands,woodlands,yard,zone".split(',');

    return{
        getName: function(){ 
            return [first,last].map(function(a){return a[(Math.random()*a.length)|0]}).join(' ');
        }
    }
})();