from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt

import aiml2
import json
import requests

k = aiml2.Kernel()
k.loadBrain("ai/static/aimldb/aiml.brn")
googleAPIKey = "***REMOVED***"

def index(request):
    return render_to_response('index_ai.html')

@csrf_exempt
def message(request):
    user = request.POST.get("user")
    text = request.POST.get("text")
    lang = request.POST.get("lang")

    # We want just "en" not "en-US"
    lang = lang.split("-")[0]
    
    if (not "en" in lang):
        text = translate(text, lang, "en")
    
    response = k.respond(text, user)

    if (not "en" in lang):
        response = translate(response, "en", lang)

    return HttpResponse(response)

def translate(text, lang, target):
    #print 'translate: ', text, lang, target
    r = requests.get("https://www.googleapis.com/language/translate/v2?key=" + googleAPIKey + "&source=" + lang + "&target=" + target + "&q=" + text)
    d = json.loads(r.content)
    return d["data"]["translations"][0]["translatedText"]
