from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ChatMessage as chatMessage
from .serializers import ChatMessageSerializer

@api_view(['GET'])
def chatapp_home(request):
    # in function-based api_view, use request.GET for query params
    project_id = request.GET.get('project_id')

    if not project_id:
        return Response({'error': 'project_id is required'}, status=400)

    try:
        messages = chatMessage.objects.filter(
            project__id=project_id
        ).order_by('timestamp')

        serializer = ChatMessageSerializer(messages, many=True)
        return Response({'messages': serializer.data}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=400)