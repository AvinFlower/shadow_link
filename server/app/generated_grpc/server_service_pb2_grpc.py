# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc
import warnings

from app.generated_grpc import server_service_pb2 as server__service__pb2

GRPC_GENERATED_VERSION = '1.71.0'
GRPC_VERSION = grpc.__version__
_version_not_supported = False

try:
    from grpc._utilities import first_version_is_lower
    _version_not_supported = first_version_is_lower(GRPC_VERSION, GRPC_GENERATED_VERSION)
except ImportError:
    _version_not_supported = True

if _version_not_supported:
    raise RuntimeError(
        f'The grpc package installed is at version {GRPC_VERSION},'
        + f' but the generated code in server_service_pb2_grpc.py depends on'
        + f' grpcio>={GRPC_GENERATED_VERSION}.'
        + f' Please upgrade your grpc module to grpcio>={GRPC_GENERATED_VERSION}'
        + f' or downgrade your generated code using grpcio-tools<={GRPC_VERSION}.'
    )


class ServerServiceStub(object):
    """Описание gRPC сервиса для управления серверами
    """

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.ListServers = channel.unary_unary(
                '/server.ServerService/ListServers',
                request_serializer=server__service__pb2.ListServersRequest.SerializeToString,
                response_deserializer=server__service__pb2.ListServersResponse.FromString,
                _registered_method=True)
        self.CreateServer = channel.unary_unary(
                '/server.ServerService/CreateServer',
                request_serializer=server__service__pb2.CreateServerRequest.SerializeToString,
                response_deserializer=server__service__pb2.CreateServerResponse.FromString,
                _registered_method=True)
        self.UpdateServer = channel.unary_unary(
                '/server.ServerService/UpdateServer',
                request_serializer=server__service__pb2.UpdateServerRequest.SerializeToString,
                response_deserializer=server__service__pb2.UpdateServerResponse.FromString,
                _registered_method=True)
        self.DeleteServer = channel.unary_unary(
                '/server.ServerService/DeleteServer',
                request_serializer=server__service__pb2.DeleteServerRequest.SerializeToString,
                response_deserializer=server__service__pb2.DeleteServerResponse.FromString,
                _registered_method=True)


class ServerServiceServicer(object):
    """Описание gRPC сервиса для управления серверами
    """

    def ListServers(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def CreateServer(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def UpdateServer(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def DeleteServer(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_ServerServiceServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'ListServers': grpc.unary_unary_rpc_method_handler(
                    servicer.ListServers,
                    request_deserializer=server__service__pb2.ListServersRequest.FromString,
                    response_serializer=server__service__pb2.ListServersResponse.SerializeToString,
            ),
            'CreateServer': grpc.unary_unary_rpc_method_handler(
                    servicer.CreateServer,
                    request_deserializer=server__service__pb2.CreateServerRequest.FromString,
                    response_serializer=server__service__pb2.CreateServerResponse.SerializeToString,
            ),
            'UpdateServer': grpc.unary_unary_rpc_method_handler(
                    servicer.UpdateServer,
                    request_deserializer=server__service__pb2.UpdateServerRequest.FromString,
                    response_serializer=server__service__pb2.UpdateServerResponse.SerializeToString,
            ),
            'DeleteServer': grpc.unary_unary_rpc_method_handler(
                    servicer.DeleteServer,
                    request_deserializer=server__service__pb2.DeleteServerRequest.FromString,
                    response_serializer=server__service__pb2.DeleteServerResponse.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'server.ServerService', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))
    server.add_registered_method_handlers('server.ServerService', rpc_method_handlers)


 # This class is part of an EXPERIMENTAL API.
class ServerService(object):
    """Описание gRPC сервиса для управления серверами
    """

    @staticmethod
    def ListServers(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/server.ServerService/ListServers',
            server__service__pb2.ListServersRequest.SerializeToString,
            server__service__pb2.ListServersResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)

    @staticmethod
    def CreateServer(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/server.ServerService/CreateServer',
            server__service__pb2.CreateServerRequest.SerializeToString,
            server__service__pb2.CreateServerResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)

    @staticmethod
    def UpdateServer(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/server.ServerService/UpdateServer',
            server__service__pb2.UpdateServerRequest.SerializeToString,
            server__service__pb2.UpdateServerResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)

    @staticmethod
    def DeleteServer(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/server.ServerService/DeleteServer',
            server__service__pb2.DeleteServerRequest.SerializeToString,
            server__service__pb2.DeleteServerResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)
